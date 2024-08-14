import requests
import mysql.connector
import os
from urllib.parse import urlparse

# API 요청 설정
api_url = 'https://api.nookipedia.com/villagers'
api_key = '64df4159-4665-49dc-b069-176558712fcc'
headers = {
    'X-API-KEY': api_key,
    'Accept-Version': '1.0.0'
}

# API에서 데이터 가져오기
response = requests.get(api_url, headers=headers)
data = response.json()

# MySQL 데이터베이스 연결 설정
db_config = {
    'user': 'lch',
    'password': 'dlaclgus1106',
    'host': '127.0.0.1',
    'port': '3306',
    'database': 'animalforest'
}

conn = mysql.connector.connect(**db_config)
cursor = conn.cursor()

cursor.execute('''
CREATE TABLE IF NOT EXISTS villager_data (
    name VARCHAR(255),
    image_url VARCHAR(255),
    PRIMARY KEY (name)
)
# ''')

for index, item in enumerate(data):
    index_two = index
    name = f"{index_two}"
    image_url = f"/assets/villagers_img/{index + 1}.png"

    cursor.execute('''
    INSERT INTO villager_data (name, image_url)
    VALUES (%s, %s)
    ON DUPLICATE KEY UPDATE image_url = VALUES(image_url);
    ''', (name, image_url))

conn.commit()
cursor.close()
conn.close
