from rembg import remove
from PIL import Image

# Define input and output paths
input_path = 'assets/co-worker2.png'  # Replace with your input image file
output_path = 'assets/co-worker2_no_bg.png' # Desired output file name

# Open the input image
input_image = Image.open(input_path)

# Remove the background
output_image = remove(input_image)

# Save the output image
output_image.save(output_path)

print(f"Background removed and saved to {output_path}")