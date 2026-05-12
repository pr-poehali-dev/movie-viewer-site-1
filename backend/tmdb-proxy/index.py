import json
import os
import http.client
import urllib.parse

TMDB_HOST = "api.themoviedb.org"
TOKEN = os.environ.get("TMDB_TOKEN", "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzZmU1ZDQ5NzU5N2JiNWM1NTQzOTExZThhOWFkMjA3NiIsIm5iZiI6MTc3ODU5NTExMS44NzIsInN1YiI6IjZhMDMzNTI3NjBlYjIwNmZhNDFlNDVkNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.05UV61EjcFnV7Xvq0_NMNBgSuyYbZdB0Mw-yqMx1J3A")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

def handler(event: dict, context) -> dict:
    """Прокси для запросов к TMDB API"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    params = event.get("queryStringParameters") or {}
    path = params.get("path", "/trending/movie/week")
    language = params.get("language", "ru-RU")
    query = params.get("query", "")

    qs_params = {"language": language}
    if query:
        qs_params["query"] = query

    qs = urllib.parse.urlencode(qs_params)
    full_path = f"/3{path}?{qs}"

    conn = http.client.HTTPSConnection(TMDB_HOST)
    conn.request("GET", full_path, headers={
        "Authorization": f"Bearer {TOKEN}",
        "Accept": "application/json",
    })
    resp = conn.getresponse()
    data = json.loads(resp.read().decode())
    conn.close()

    return {
        "statusCode": 200,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps(data),
    }