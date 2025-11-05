from bs4 import BeautifulSoup
import requests

def handler(request):
    try:
        data = request.json()
        url = data.get('url')
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": {"text": soup.get_text()}
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": {"error": str(e)}
        }
