# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2025_05_24_191358) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "categories", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.bigint "user_id", null: false
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "color", default: "#3B82F6"
    t.index ["user_id"], name: "index_categories_on_user_id"
  end

  create_table "commitment_milestones", force: :cascade do |t|
    t.bigint "commitment_id", null: false
    t.bigint "milestone_id", null: false
    t.integer "contribution_percentage"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["commitment_id"], name: "index_commitment_milestones_on_commitment_id"
    t.index ["milestone_id"], name: "index_commitment_milestones_on_milestone_id"
  end

  create_table "commitments", force: :cascade do |t|
    t.string "title"
    t.text "description"
    t.string "frequency"
    t.date "start_date"
    t.date "end_date"
    t.boolean "completed"
    t.bigint "user_id", null: false
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "category_id"
    t.time "daily_reset_time"
    t.integer "weekly_reset_day"
    t.integer "monthly_reset_day"
    t.datetime "last_reset_at"
    t.integer "streak_count", default: 0
    t.integer "longest_streak", default: 0
    t.integer "current_streak"
    t.integer "best_streak"
    t.index ["user_id"], name: "index_commitments_on_user_id"
  end

  create_table "completions", force: :cascade do |t|
    t.bigint "commitment_id", null: false
    t.datetime "completed_at"
    t.date "due_date", null: false
    t.integer "status", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["commitment_id", "due_date"], name: "index_completions_on_commitment_and_due_date", unique: true
    t.index ["commitment_id"], name: "index_completions_on_commitment_id"
    t.index ["due_date"], name: "index_completions_on_due_date"
    t.index ["status"], name: "index_completions_on_status"
  end

  create_table "group_memberships", force: :cascade do |t|
    t.bigint "group_id", null: false
    t.bigint "user_id", null: false
    t.string "role"
    t.datetime "joined_at"
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["group_id"], name: "index_group_memberships_on_group_id"
    t.index ["user_id"], name: "index_group_memberships_on_user_id"
  end

  create_table "groups", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.bigint "user_id", null: false
    t.boolean "private"
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_groups_on_user_id"
  end

  create_table "milestones", force: :cascade do |t|
    t.string "title"
    t.text "description"
    t.date "target_date"
    t.string "status"
    t.bigint "user_id", null: false
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_milestones_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "phone"
    t.integer "position"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "categories", "users"
  add_foreign_key "commitment_milestones", "commitments"
  add_foreign_key "commitment_milestones", "milestones"
  add_foreign_key "commitments", "users"
  add_foreign_key "completions", "commitments"
  add_foreign_key "group_memberships", "groups"
  add_foreign_key "group_memberships", "users"
  add_foreign_key "groups", "users"
  add_foreign_key "milestones", "users"
end
