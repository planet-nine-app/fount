import requests

async def get(url):
    headers = {'content-type': 'application/json'}
    print(f'http://localhost:3000/{url}')
    response = requests.get(f'http://localhost:3000/{url}')

    return response.json()

async def post(url, payload):
    headers = {'content-type': 'application/json'}
    print(f'http://localhost:3000/{url}')
    response = requests.post(f'http://localhost:3000/{url}', json=payload, headers=headers)

    return response.json()

async def put(url, payload):
    headers = {'content-type': 'application/json'}
    print(f'http://localhost:3000/{url}')
    response = requests.put(f'http://localhost:3000/{url}', json=payload, headers=headers)

    print(response)

    return response.json()

