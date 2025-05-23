class UpdateCommitmentsWithNilFrequency < ActiveRecord::Migration[7.1]
  def up
    # Set default frequency to 'daily' for commitments with nil frequency
    Commitment.where(frequency: nil).update_all(frequency: Commitment.frequencies[:daily])
  end

  def down
    # This migration can't be rolled back as we don't know which commitments had nil frequency
    raise ActiveRecord::IrreversibleMigration
  end
end
