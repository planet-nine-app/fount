import requests

async def get(url):
    headers = {'content-type': 'application/json'}
    response = requests.get(url=url)

    return response

async def post(url):
    headers = {'content-type': 'application/json'}
    response = requests.post(url=url, payload=payload)

    return response

