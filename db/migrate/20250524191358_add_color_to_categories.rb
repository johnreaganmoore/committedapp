class AddColorToCategories < ActiveRecord::Migration[7.1]
  def change
    add_column :categories, :color, :string, default: "#3B82F6" # Default to blue-500
  end
end
