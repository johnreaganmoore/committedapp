class CreateCategories < ActiveRecord::Migration[7.1]
  def change
    create_table :categories do |t|
      t.string :name
      t.text :description
      t.references :user, null: false, foreign_key: true
      t.integer :position

      t.timestamps
    end
  end
end
