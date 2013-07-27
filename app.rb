require 'rubygems'
require 'sinatra/base'
require 'yaml'
require 'twilio-ruby'

require 'pusher'

class App < Sinatra::Base

  set :public_folder, Proc.new { File.join(root, "public") }
  
  config = YAML.load_file('./config.yml')
  
  Pusher.app_id = config['pusher']['app_id']
  Pusher.key = config['pusher']['app_key']
  Pusher.secret = config['pusher']['app_secret']
  
  get '/' do
    @app_key = config['pusher']['app_key']
    erb :index
  end
  
  post '/sms' do
    if params['AccountSid'] != config['twilio']['account_sid']
      status 401
    else
      Pusher['sms'].trigger('sms_received', {
        :from_city => "***-" + params['From'][-4, 4],
        :timestamp => Time.now.strftime("%Y-%m-%dT%H:%M:%S"),
        :text => params['Body']
      })
      twiml = Twilio::TwiML::Response.new do |r|
        r.Sms "Thanks for being part of GroupJuke. You're a real pal. Vote again if you'd like."
      end
      twiml.text
    end
  end
    
  run! if app_file == $0

end