class DropCommentsTable < ActiveRecord::Migration[7.1]
  def up
    drop_table :comments
  end

  def down
    create_table :comments do |t|
      t.text :content
      t.references :commentable, polymorphic: true, null: false
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
