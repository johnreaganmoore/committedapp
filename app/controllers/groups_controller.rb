class GroupsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_group, only: [:show, :edit, :update, :destroy]

  def index
    @groups = current_user.groups.includes(:users)
  end

  def show
    @members = @group.users.includes(:groups)
    @comments = @group.comments.top_level.includes(:user, :replies)
  end

  def new
    @group = current_user.groups.build
  end

  def edit
  end

  def create
    @group = current_user.groups.build(group_params)
    if @group.save
      GroupMembership.create!(group: @group, user: current_user, role: :admin)
      redirect_to @group, notice: 'Group was successfully created.'
    else
      render :new
    end
  end

  def update
    if @group.update(group_params)
      redirect_to @group, notice: 'Group was successfully updated.'
    else
      render :edit
    end
  end

  def destroy
    @group.destroy
    redirect_to groups_url, notice: 'Group was successfully destroyed.'
  end

  private

  def set_group
    @group = Group.find(params[:id])
    authorize @group
  end

  def group_params
    params.require(:group).permit(:name, :description, :private)
  end
end
