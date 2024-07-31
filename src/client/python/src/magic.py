from src.network.network import get, post
from sessionless import SessionlessSecp256k1
import time
import requests

async def sendSpellToResolver(spell, gateway):
    sessionless = SessionlessSecp256k1()

    payload = spell.copy()

    if gateway is not None:
       payload['gateways'].append(gateway)

    response = post(url='resolve', payload=payload)

    return response
