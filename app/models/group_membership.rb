class GroupMembership < ApplicationRecord
  belongs_to :group
  belongs_to :user

  # Enum for role in group
  enum role: { member: 0, admin: 1 }
  
  # Include acts_as_list for ordering members within a group
  acts_as_list scope: :group_id
end
