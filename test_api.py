import urllib.request, json
req = urllib.request.Request('http://127.0.0.1:8000/api/v1/auth/login', data=json.dumps({"firebase_token":"dev_1234567890"}).encode('utf-8'), headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as r:
        print(r.read())
except Exception as e:
    print("ERROR:", e)
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
