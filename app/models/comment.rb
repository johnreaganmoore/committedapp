class Comment < ApplicationRecord
  # Relationships
  belongs_to :user
  belongs_to :commentable, polymorphic: true
  belongs_to :parent_comment, class_name: 'Comment', optional: true
  has_many :replies, class_name: 'Comment', foreign_key: :parent_comment_id, dependent: :destroy

  # Validations
  validates :content, presence: true, length: { maximum: 1000 }

  # Scope for top-level comments
  scope :top_level, -> { where(parent_comment_id: nil) }

  # Method to get all replies recursively
  def all_replies
    replies.includes(:replies)
  end
end
