#!/usr/bin/env python3
"""Airbnb scraper using undetected-chromedriver — bypasses antibot detection."""

import sys
import time
import json
import base64
import re
from urllib.parse import quote

try:
    import undetected_chromedriver as uc
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    import seleniumwire.undetected_chromedriver as suc
except ImportError:
    print("Installing undetected-chromedriver...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "undetected-chromedriver", "-q"])
    import undetected_chromedriver as uc
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC

SB_BUCKET = 'NewSiteOnboarding'
SB_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0emFncGJkcnFmaWZkaXN4aXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzUyODUsImV4cCI6MjA2MDMxMTI4NX0.uWqc82Hb-qnRq4H9kg5IPykUosm9VvU2s6e8mOalkR0'
SUPABASE_URL = 'https://jtzagpbdrqfifdisxipr.supabase.co'

def upload_to_supabase(image_data, filename):
    """Upload image bytes to Supabase storage."""
    try:
        import requests
        url = f"{SUPABASE_URL}/storage/v1/object/{SB_BUCKET}/{filename}"
        resp = requests.post(url, data=image_data, headers={
            'Authorization': f'Bearer {SB_ANON_KEY}',
            'apikey': SB_ANON_KEY,
            'Content-Type': 'image/jpeg',
            'x-upsert': 'true'
        })
        if resp.status_code in (200, 201):
            return f"{SUPABASE_URL}/storage/v1/object/public/{SB_BUCKET}/{filename}"
    except Exception as e:
        print(f"Upload error: {e}")
    return None

def download_image(url):
    """Download image bytes from URL."""
    try:
        import requests
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }
        resp = requests.get(url, headers=headers, timeout=15)
        if resp.status_code == 200:
            return resp.content
    except Exception as e:
        print(f"Image download error: {e}")
    return None

def scrape_airbnb(url):
    """Scrape Airbnb listing using undetected-chromedriver."""
    options = uc.ChromeOptions()
    options.add_argument('--headless=new')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_argument('--disable-blink-features=Automation')
    options.add_argument('--no-first-run')
    options.add_argument('--no-default-browser-check')
    options.add_argument('--disable-hang-monitor')
    options.add_argument('--disable-popup-blocking')

    driver = None
    data = {
        'title': None, 'location': None, 'price': None, 'currency': 'USD',
        'guests': None, 'bedrooms': None, 'beds': None, 'baths': None,
        'rating': None, 'reviews': None, 'hero_image': None,
        'images': [], 'description': None, 'host_name': None, 'error': None
    }

    try:
        driver = uc.Chrome(options=options, version_main=None)
        driver.set_page_load_timeout(30)
        
        print(f"Navigating to {url}...")
        driver.get(url)
        
        # Wait for page to stabilize
        time.sleep(3)
        
        # Check if we hit a CAPTCHA/Oops page
        title = driver.title or ''
        if 'Oops' in title or 'access' in title.lower():
            # Try to find og:title meta tag
            try:
                og_title = driver.find_element(By.CSS_SELECTOR, 'meta[property="og:title"]')
                content = og_title.get_attribute('content')
                if content and 'Oops' not in content:
                    data['title'] = content.split('·')[0].strip()
            except: pass
        
        # Get og:title
        try:
            og_title = driver.find_element(By.CSS_SELECTOR, 'meta[property="og:title"]')
            content = og_title.get_attribute('content') or ''
            if content:
                parts = content.split('·')
                data['title'] = parts[0].strip()
                if len(parts) > 1:
                    data['location'] = parts[1].strip()
        except: pass
        
        # Get og:image
        try:
            og_images = driver.find_elements(By.CSS_SELECTOR, 'meta[property="og:image"]')
            for meta in og_images:
                src = meta.get_attribute('content')
                if src and src not in data['images']:
                    # Upgrade to larger size
                    src = re.sub(r'\?.*', '', src) + '?im_w=1200'
                    data['images'].append(src)
        except: pass
        
        if data['images']:
            data['hero_image'] = data['images'][0]
        
        # Get JSON-LD
        try:
            scripts = driver.find_elements(By.CSS_SELECTOR, 'script[type="application/ld+json"]')
            for script in scripts:
                try:
                    content = script.get_attribute('innerHTML')
                    if not content: continue
                    parsed = json.loads(content)
                    # Look for LodgingBusiness
                    def find_listing(obj):
                        if isinstance(obj, dict):
                            if obj.get('@type') in ('LodgingBusiness', 'Hotel', 'VacationRental'):
                                return obj
                            for v in obj.values():
                                result = find_listing(v)
                                if result: return result
                        elif isinstance(obj, list):
                            for item in obj:
                                result = find_listing(item)
                                if result: return result
                        return None
                    listing = find_listing(parsed)
                    if listing:
                        if not data['description'] and listing.get('description'):
                            data['description'] = listing['description'][:1500]
                        if not data['host_name']:
                            author = listing.get('author')
                            if isinstance(author, str):
                                data['host_name'] = author
                            elif author and author.get('name'):
                                data['host_name'] = author['name']
                except: pass
        except: pass
        
        # Try to get h1
        try:
            h1 = driver.find_element(By.TAG_NAME, 'h1')
            text = h1.text.strip()
            if text and len(text) > 2 and 'Oops' not in text:
                data['title'] = text
        except: pass
        
        # Get price from page text
        try:
            page_text = driver.page_source
            price_match = re.search(r'\$([\d,]+)', page_text)
            if price_match:
                data['price'] = price_match.group(1).replace(',', '')
        except: pass
        
        print(f"Scraped: {data['title']}, {len(data['images'])} images, price: {data['price']}")
        
    except Exception as e:
        data['error'] = str(e)
        print(f"Error: {e}")
    finally:
        if driver:
            try: driver.quit()
            except: pass
    
    return {'success': True, 'data': data}

def main():
    from http.server import HTTPServer, BaseHTTPRequestHandler
    import urllib.parse

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path == '/health':
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'ok'}).encode())
                return

            if self.path.startswith('/scrape'):
                parsed = urllib.parse.urlparse(self.path)
                params = urllib.parse.parse_qs(parsed.query)
                target_url = params.get('url', [None])[0]

                if not target_url:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'success': False, 'error': 'Missing url'}).encode())
                    return

                print(f"\n[SCRAPE] {target_url}")
                result = scrape_airbnb(target_url)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode())
                return

            self.send_response(404)
            self.end_headers()

        def log_message(self, fmt, *args):
            print(fmt % args)

    PORT = 6905
    server = HTTPServer(('0.0.0.0', PORT), Handler)
    print(f"Airbnb scraper (Python/undetected-chromedriver) running on port {PORT}")
    print(f"Bucket: {SB_BUCKET}")
    server.serve_forever()

if __name__ == '__main__':
    main()
