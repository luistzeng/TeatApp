# TeatApp

## Bot-verification (CAPTCHA) demo

Recreates the case-number search form's "I am not a robot" verification
widget as a small API + app pair.

- `api/` — Express service that generates a 6-character verification code
  as an SVG image (`GET /api/captcha`) and checks a submitted code
  (`POST /api/captcha/verify`). Codes are single-use and expire after 5
  minutes.
- `app/` — Static frontend that reproduces the search form: case-number
  field, the verification-code image, a regenerate button, and a search
  button that verifies the typed code against the API.

### Run it

```bash
# terminal 1 — API on http://localhost:4000
cd api
npm install
npm start

# terminal 2 — app on http://localhost:8080
cd app
python3 -m http.server 8080
```

Then open http://localhost:8080. To point the app at a different API host,
set `window.CAPTCHA_API_BASE` before `app.js` loads.
