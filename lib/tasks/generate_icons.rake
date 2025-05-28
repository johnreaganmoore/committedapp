require 'rmagick'

namespace :icons do
  desc "Generate PWA icons"
  task generate: :environment do
    sizes = [192, 512]
    
    sizes.each do |size|
      # Create a new image with a blue background
      image = Magick::Image.new(size, size) do |img|
        img.background_color = '#3b82f6'
      end
      
      # Create a draw object for the emoji
      draw = Magick::Draw.new
      
      # Use a system font that supports emoji
      draw.font = if Gem.win_platform?
        'Segoe UI Emoji'
      else
        'Apple Color Emoji'
      end
      
      draw.pointsize = size * 0.6
      draw.gravity = Magick::CenterGravity
      draw.fill = 'white'
      
      # Add the handshake emoji
      draw.annotate(image, 0, 0, 0, 0, '🤝')
      
      # Add a white border for better visibility
      image = image.border(1, 1, 'white')
      
      # Save the image
      output_path = Rails.root.join('public', 'icons', "icon-#{size}x#{size}.png")
      image.write(output_path)
      
      puts "Generated icon at #{output_path}"
    end
  end
end 