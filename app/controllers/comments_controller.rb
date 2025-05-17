class CommentsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_comment, only: [:show, :edit, :update, :destroy]

  def index
    @commentable = find_commentable
    @comments = @commentable.comments.top_level.includes(:user, :replies)
  end

  def show
  end

  def new
    @comment = Comment.new
  end

  def edit
  end

  def create
    @commentable = find_commentable
    @comment = @commentable.comments.build(comment_params)
    @comment.user = current_user
    @comment.parent_comment = params[:parent_comment_id].present? ? Comment.find(params[:parent_comment_id]) : nil

    if @comment.save
      redirect_to @commentable, notice: 'Comment was successfully created.'
    else
      render :new
    end
  end

  def update
    if @comment.update(comment_params)
      redirect_to @commentable, notice: 'Comment was successfully updated.'
    else
      render :edit
    end
  end

  def destroy
    @comment.destroy
    redirect_to @commentable, notice: 'Comment was successfully destroyed.'
  end

  private

  def find_commentable
    params.each do |name, value|
      if name =~ /(.+)_id$/
        return $1.classify.constantize.find(value)
      end
    end
    nil
  end

  def set_comment
    @comment = Comment.find(params[:id])
    @commentable = @comment.commentable
    authorize @comment
  end

  def comment_params
    params.require(:comment).permit(:content, :parent_comment_id)
  end
end
