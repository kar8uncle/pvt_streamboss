require "sass"

module Sass::Script::Functions
  def pngwidth(image)
    assert_type image, :String

    # compute file/path/extension
    base_path = "../../.."
    root = File.expand_path(base_path, __FILE__)
    path = image.to_s[4,image.to_s.length-5]
    fullpath = File.expand_path(path, root)

    width = IO.read(fullpath)[0x10..0x14].unpack('N')[0]

    Sass::Script::Number.new(width, "px")

  end
  declare :pngwidth, :args => [:string]

  def pngheight(image)
    assert_type image, :String

    # compute file/path/extension
    base_path = "../../.."
    root = File.expand_path(base_path, __FILE__)
    path = image.to_s[4,image.to_s.length-5]
    fullpath = File.expand_path(path, root)

    height = IO.read(fullpath)[0x14..0x18].unpack('N')[0]

    Sass::Script::Number.new(height, "px")

  end
  declare :pngheight, :args => [:string]
end

