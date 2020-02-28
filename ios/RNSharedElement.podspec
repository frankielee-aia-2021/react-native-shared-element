require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', "package.json")))

Pod::Spec.new do |s|
  s.name           = "RNSharedElement"
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  s.platforms      = { :ios => "9.0" }
  s.source         = { :git => "https://github.com/IjzerenHein/expo-shared-element.git", :tag => "v#{s.version}" }
  s.source_files   = "RNSharedElement/**/*.{h,m}"
  s.preserve_paths = "RNSharedElement/**/*.{h,m}"

  s.dependency 'React'
end
