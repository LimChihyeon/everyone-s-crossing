import sys
from PIL import Image

def resize_image(image_path, output_path='resized_image.jpg', size=(32, 32)):
    with Image.open(image_path) as img:
        img = img.resize(size, Image.Resampling.LANCZOS)
        img.save(output_path)
    print(output_path)

if __name__ == "__main__":
    image_path = sys.argv[1]
    resize_image(image_path)
