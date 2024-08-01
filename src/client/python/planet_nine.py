from builtins import ValueError

import sys
import os

client_path = os.path.abspath(os.path.join(os.path.dirname(__file__)))
sys.path.insert(0, client_path)

from src.user import register, get_user_by_uuid, get_user_by_pub_key, get_nineum
from src.transfer import transfer
from src.magic import send_spell_to_resolver
from src.grant import grant

async def join_planet_nine(user, save_keys, get_keys):
    return await register(user, save_keys, get_keys)

async def get_user(credential, get_keys):
    if len(credential) != 36:
        return await get_user_by_pub_key(credential, get_keys)

    return await get_user_by_uuid(credential, get_keys)

async def forward_spell(spell, gateway, get_keys):
    # Eventually spells can be forwarded to other gateways, and not just resolvers, but for now
    # we'll just do the Planet Nine resolver

    return await send_spell_to_resolver(spell, gateway, get_keys)

async def grant_experience(uuid, destinationUUID, amount, description, get_keys):
    if amount <= 0:
        raise ValueError('Amount must be positive')

    return await grant(uuid, destinationUUID, amount, description, get_keys)

async def nineum(uuid, get_keys):
    return await get_nineum(uuid, get_keys)

async def transfer_nineum(uuid, destinationUUID, nineumUniqueIds, get_keys):
    return await transfer(uuid, destinationUUID, nineumUniqueIds, 0, 'USD', get_keys)


