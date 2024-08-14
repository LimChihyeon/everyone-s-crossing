import requests
import os

# API 요청 설정
api_url = 'https://api.nookipedia.com/nh/fossils/individuals'
api_key = '64df4159-4665-49dc-b069-176558712fcc'
headers = {
    'X-API-KEY': api_key,
    'Accept-Version': '1.0.0'
}

# API에서 데이터 가져오기
response = requests.get(api_url, headers=headers)
data = response.json()

def download_image(url, file_path):
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        with open(file_path, 'wb') as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)

image_dir = os.path.join(os.path.dirname(__file__), '../assets/fossils_img')
os.makedirs(image_dir, exist_ok=True)

for index, item in enumerate(data):
    image_url = item['image_url']
    
    image_path = os.path.join(image_dir, f"{index + 1}.png")  # 인덱스를 1부터 시작하도록 설정

    download_image(image_url, image_path)
    print(f"{index + 1}.png 다운로드 완료")
