class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception, prepend: true
  
  before_action :set_csrf_cookie
  
  private
  
  def set_csrf_cookie
    cookies['XSRF-TOKEN'] = {
      value: form_authenticity_token,
      secure: Rails.env.production?,
      httponly: false,
      same_site: :lax
    }
  end
end
