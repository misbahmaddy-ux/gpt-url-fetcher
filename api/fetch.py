from bs4 import BeautifulSoup
import requests

def handler(request):
    if request.method != "POST":
        return {
            "statusCode": 405,
            "headers": {"Content-Type": "application/json"},
            "body": {"error": "Method Not Allowed. Use POST with JSON body"}
        }

    try:
        data = request.json()
        url = data.get("url")

        if not url:
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": {"error": "Missing 'url' in request body"}
            }

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code != 200:
            return {
                "statusCode": response.status_code,
                "headers": {"Content-Type": "application/json"},
                "body": {"error": f"Failed to fetch content. Status code: {response.status_code}"}
            }

        soup = BeautifulSoup(response.text, "html.parser")
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": {"text": soup.get_text()}
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": {"error": str(e)}
        }
