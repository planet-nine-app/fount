import pytest
import sys
import os
import time

client_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, client_path)

from src.client.python.planet_nine import * 

global user
global user_nineum
global keyPair
global keyPair2 

user = {
    "foo": "bar"
}

user_nineum = []

keyPair = {
    "privateKey": "foo",
    "publicKey": "bar"
}

keyPair2 = {
    "privateKey": "foo",
    "publicKey": "bar"
}



def save_keys(keys):
    global keyPair
    keyPair["privateKey"] = keys["privateKey"]
    keyPair["publicKey"] = keys["publicKey"]

def get_keys():
    global keyPair
    return keyPair["privateKey"]

def save_keys2(keys):
    global keyPair2
    keyPair2["privateKey"] = keys["privateKey"]
    keyPair2["publicKey"] = keys["publicKey"]

def get_keys2():
    global keyPair2
    return keyPair2["privateKey"]




pytest_plugins = ('pytest_asyncio',)

@pytest.mark.asyncio
async def test_join_planet_nine():
    global user
    user = await join_planet_nine(user, save_keys, get_keys)

    assert len(user['uuid']) == 36

@pytest.mark.asyncio
async def test_get_user_by_uuid():
    global user
    user = await get_user(user['uuid'], get_keys)

    assert len(user['uuid']) == 36

@pytest.mark.asyncio
async def test_get_user_by_public_key():
    global keyPair
    user = await get_user(keyPair['publicKey'], get_keys)

    assert len(user['uuid']) == 36

@pytest.mark.asyncio
async def test_cast_spell():
    global user
    spell = {
	"timestamp": f'{round(time.time() * 1000)}',
	"spell": "test",
	"casterUUID": user['uuid'],
	"totalCost": 400,
	"mp": 400,
	"ordinal": user['ordinal'],
        "gateways": []
    }

    response = await forward_spell(spell, None, get_keys)

    assert response['success'] == True

@pytest.mark.asyncio
async def test_grant_experience():
    global user
    user = await grant_experience(user['uuid'], user['uuid'], 500, 'for testing', get_keys)
   
    assert user['mp'] == 566 # Update this once spells grant experience

@pytest.mark.asyncio
async def test_get_user_nineum():
    global user
    global user_nineum
    user_nineum = await nineum(user['uuid'], get_keys)

    assert len(user_nineum['nineum']) == 2

@pytest.mark.asyncio
async def test_transfer_user_nineum():
    global user
    payload = {
      "baz": "bop"
    }
    user2 = await join_planet_nine(payload, save_keys2, get_keys2)

    user = await transfer_nineum(user['uuid'], user2['uuid'], user_nineum['nineum'], get_keys)

    assert user['nineumCount'] == 0
