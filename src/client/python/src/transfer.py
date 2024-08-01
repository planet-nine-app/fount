from src.network.network import get, post
from sessionless import SessionlessSecp256k1
import time

async def transfer(uuid, destinationUUID, nineumUniqueIds, price, currency, get_keys):
    sessionless = SessionlessSecp256k1()

    timestamp = f'{round(time.time() * 1000)}'
    message = f'{timestamp}{uuid}{destinationUUID}{''.join(nineumUniqueIds)}{price}{currency}'
    signature = await sessionless.sign(message.encode('ascii'), get_keys)

    payload = {
        "timestamp": timestamp,
        "uuid": uuid,
        "destinationUUID": destinationUUID,
        "nineumUniqueIds": nineumUniqueIds,
        "price": price,
        "currency": currency,
        "signature": signature
    }

    response = await post(f'user/{uuid}/transfer', payload)

    return response
