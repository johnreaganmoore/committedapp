class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  # Relationships
  has_many :groups, foreign_key: :user_id
  has_many :group_memberships
  has_many :categories, dependent: :destroy
  has_many :milestones, dependent: :destroy
  has_many :commitments, dependent: :destroy
  has_many :comments, dependent: :destroy
  has_many :commitment_milestones, through: :commitments

  # Phone number validations
  validates :phone, presence: true, format: { with: /\A\+?[0-9\s-]+\z/ },
                    length: { minimum: 10, maximum: 20 }

  # Format phone number before saving
  before_save :format_phone_number

  # Acts as list configuration
  acts_as_list scope: nil
  
  # Override acts_as_list methods to handle nil user_id
  def bottom_position_in_list
    self.class.maximum(:position) || 0
  end
  
  def bottom_item
    self.class.order(position: :desc).first
  end

  private

  def format_phone_number
    self.phone = phone.to_s.gsub(/[^0-9]/, '') if phone.present?
  end

  private

  def format_phone_number
    return unless phone.present?
    self.phone = phone.gsub(/[^\d+]/, '').gsub(/^1/, '') if phone.start_with?('1')
  end

  # Include acts_as_list for ordering categories
  acts_as_list scope: :user_id
end
