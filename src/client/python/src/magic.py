from src.network.network import get, post
from sessionless import SessionlessSecp256k1
import time
import requests

async def send_spell_to_resolver(spell, gateway, get_keys):
    sessionless = SessionlessSecp256k1()

    payload = spell.copy()

    if gateway is not None:
       payload['gateways'].append(gateway)

    message = f'{{"timestamp":"{spell["timestamp"]}","spell":"test","casterUUID":"{spell["casterUUID"]}","totalCost":"{spell["totalCost"]}","mp":"{spell["mp"]}","ordinal":"{spell["ordinal"]}"}}'
    signature = await sessionless.sign(message.encode('ascii'), get_keys)
    payload['casterSignature'] = signature

    response = await post('resolve', payload)

    return response
