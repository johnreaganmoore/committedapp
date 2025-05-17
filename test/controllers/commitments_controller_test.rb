require "test_helper"

class CommitmentsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get commitments_index_url
    assert_response :success
  end

  test "should get show" do
    get commitments_show_url
    assert_response :success
  end

  test "should get new" do
    get commitments_new_url
    assert_response :success
  end

  test "should get edit" do
    get commitments_edit_url
    assert_response :success
  end

  test "should get create" do
    get commitments_create_url
    assert_response :success
  end

  test "should get update" do
    get commitments_update_url
    assert_response :success
  end

  test "should get destroy" do
    get commitments_destroy_url
    assert_response :success
  end
end
