# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2019_01_16_120212) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "connections", force: :cascade do |t|
    t.integer "map_id"
    t.string "first_object_type"
    t.bigint "first_object_id"
    t.string "second_object_type"
    t.bigint "second_object_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["first_object_type", "first_object_id"], name: "index_connections_on_first_object_type_and_first_object_id"
    t.index ["second_object_type", "second_object_id"], name: "index_connections_on_second_object_type_and_second_object_id"
  end

  create_table "devices", force: :cascade do |t|
    t.string "display_name"
    t.string "ip_address"
    t.string "host_type_name"
    t.boolean "monitored"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "host_name"
    t.integer "zbx_id"
    t.boolean "icmp_available"
    t.string "description"
  end

  create_table "items", force: :cascade do |t|
    t.string "name"
    t.integer "position_x"
    t.integer "position_y"
    t.string "placeable_type"
    t.bigint "placeable_id"
    t.integer "map_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["placeable_type", "placeable_id"], name: "index_items_on_placeable_type_and_placeable_id"
  end

  create_table "maps", force: :cascade do |t|
    t.string "name"
    t.integer "parent_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "shapes", force: :cascade do |t|
    t.string "shape"
    t.integer "map_id"
    t.integer "position_x"
    t.integer "position_y"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "width"
    t.integer "height"
    t.integer "radius"
    t.integer "rays_amount"
    t.integer "outside_diameter"
    t.integer "inside_diameter"
  end

end
