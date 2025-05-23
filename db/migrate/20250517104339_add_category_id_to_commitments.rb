class AddCategoryIdToCommitments < ActiveRecord::Migration[7.1]
  def change
    add_column :commitments, :category_id, :integer
  end
end
