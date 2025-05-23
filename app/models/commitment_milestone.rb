class CommitmentMilestone < ApplicationRecord
  belongs_to :commitment
  belongs_to :milestone
end
