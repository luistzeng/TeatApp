# TeatApp

## Bot-verification (CAPTCHA) demo

Recreates the case-number search form's "I am not a robot" verification
widget as a small API + app pair.

- `api/` — ASP.NET Core (.NET 8) minimal API that generates a 6-character
  verification code as an SVG image (`GET /api/captcha`) and checks a
  submitted code (`POST /api/captcha/verify`). Codes are single-use and
  expire after 5 minutes.
- `app/` — Static frontend that reproduces the search form: case-number
  field, the verification-code image, a regenerate button, and a search
  button that verifies the typed code against the API.

### Run it

Requires the [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0).

```bash
# terminal 1 — API on http://localhost:4000
cd api
dotnet run

# terminal 2 — app on http://localhost:8080
cd app
python3 -m http.server 8080
```

Then open http://localhost:8080. To point the app at a different API host,
set `window.CAPTCHA_API_BASE` before `app.js` loads.
