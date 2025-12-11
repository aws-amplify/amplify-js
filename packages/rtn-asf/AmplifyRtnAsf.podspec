# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

Pod::Spec.new do |s|
  s.name         = "AmplifyRtnAsf"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => '13.0' }
  s.source       = { :git => "https://github.com/aws-amplify/amplify-js.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,cpp,swift}"
  s.exclude_files = [ 'ios/tests' ]
  s.private_header_files = "ios/generated/**/*.h"

  # ASF SDK dependency for device context data collection
  s.dependency 'AWSCognitoIdentityProviderASF', '~> 2.0'

  install_modules_dependencies(s)

  s.test_spec 'tests' do |test_spec|
    test_spec.source_files = 'ios/tests/*.swift'
    test_spec.frameworks = 'XCTest'
  end
end
