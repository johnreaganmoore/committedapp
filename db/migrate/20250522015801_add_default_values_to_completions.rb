class AddDefaultValuesToCompletions < ActiveRecord::Migration[7.1]
  def up
    change_column_default :completions, :status, 0 # pending
    
    # Set any existing null statuses to pending
    Completion.where(status: nil).update_all(status: 0)
    
    # Make the status column not nullable
    change_column_null :completions, :status, false
  end

  def down
    change_column_null :completions, :status, true
    change_column_default :completions, :status, nil
  end
end
