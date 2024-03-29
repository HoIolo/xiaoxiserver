import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { PublishCommentDTO } from './dto/publishComment.dto';
import { code, roles } from 'src/constant';
import {
  DELETE_COMMENT_RESPONSE,
  LIKES_COMMENT_RESPONSE,
  PUBLISH_COMMENT_RESPONSE,
  REPLY_COMMENT_RESPONSE,
} from './constant';
import { Role } from 'src/common/decorator/role.decorator';
import { PageDTO } from 'src/common/dto/page.dto';
import { ReplyCommentDto } from '../article/dto/replyComment.dto';
import { ApiTags } from '@nestjs/swagger';
import { LikesDTO } from './dto/likes.dto';
import { GetCommentDto } from './dto/getComment.dto';

@ApiTags('comment')
@Controller()
@Role(roles.VISITOR)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /**
   * 获取所有评论（分页）
   * @param getCommentDto
   * @returns
   */
  @Get('comments')
  async getComments(@Query() getCommentDto: GetCommentDto) {
    let { sorted } = getCommentDto;
    if (!sorted) {
      sorted = 'DESC';
      getCommentDto.sorted = sorted;
    }
    if (sorted.toUpperCase() !== 'DESC' && sorted.toUpperCase() !== 'ASC') {
      throw new HttpException(
        {
          message: code.INVALID_PARAMS,
          code: code.INVALID_PARAMS,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const [rows, count] =
      await this.commentService.findAllByPage(getCommentDto);

    return {
      rows,
      count,
    };
  }

  /**
   * 发表评论
   * @param publishCommentDto
   * @returns
   */
  @Post('comment')
  @Role(roles.LOGGED)
  async publishComment(@Body() publishCommentDto: PublishCommentDTO) {
    const result = await this.commentService.createComment(publishCommentDto);
    if (!result) {
      throw new HttpException(
        {
          message: PUBLISH_COMMENT_RESPONSE.PUBLISH_ERROR,
          code: code.SYSTEM_ERROR,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return {
      row: result,
      message: PUBLISH_COMMENT_RESPONSE.PUBLISH_SUCCESS,
    };
  }

  /**
   * 根据文章id获取评论（分页）
   * @param articleId
   * @param pageDto
   * @returns
   */
  @Get('/comment/:articleId')
  async getCommentByArticle(
    @Param('articleId', ParseIntPipe) articleId: number,
    @Query() pageDto: PageDTO,
  ) {
    const [rows, count] = await this.commentService.findByArticleId(
      articleId,
      pageDto,
    );

    return {
      rows,
      count,
    };
  }

  /**
   * 回复评论
   * @param replyCommentDto
   * @returns
   */
  @Post('comment/reply')
  @Role(roles.LOGGED)
  async replyComment(@Body() replyCommentDto: ReplyCommentDto) {
    const result = await this.commentService.createReply(replyCommentDto);
    if (result === null) {
      throw new HttpException(
        {
          message: REPLY_COMMENT_RESPONSE.REPLY_ERROR,
          code: code.INVALID_PARAMS,
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
    return {
      row: result,
      message: REPLY_COMMENT_RESPONSE.REPLY_SUCCESS,
    };
  }

  /**
   * 根据评论id获取回复（分页）
   * @param articleId
   * @param pageDto
   * @returns
   */
  @Get('/comment/:id/reply')
  async getReplyBycommentId(
    @Param('id', ParseIntPipe) id: number,
    @Query() pageDto: PageDTO,
  ) {
    const [rows, count] = await this.commentService.findReplyByCommentId(
      id,
      pageDto,
    );

    return {
      rows,
      count,
    };
  }

  /**
   * 评论点赞
   * @param commentId
   * @param likesDto
   * @returns
   */
  @Patch('comment/:commentId/likes')
  @Role(roles.LOGGED)
  async likesComment(
    @Param('commentId', ParseIntPipe) commentId,
    @Body() likesDto: LikesDTO,
  ) {
    const result = await this.commentService.updateCommentLikes(
      commentId,
      likesDto,
    );

    if (result === null) {
      throw new HttpException(
        {
          message: LIKES_COMMENT_RESPONSE.LIKES_ERROR,
          code: code.INVALID_PARAMS,
        },
        HttpStatus.BAD_GATEWAY,
      );
    }

    return {
      row: result,
      message: LIKES_COMMENT_RESPONSE.LIKES_SUCCESS,
    };
  }

  /**
   * 删除评论（软删除）
   * @param commentId 评论id
   * @returns
   */
  @Delete('comment/:commentId')
  @Role(roles.ADMIN)
  async deleteComment(@Param('commentId', ParseIntPipe) commentId) {
    const result = await this.commentService.deleteComment(
      commentId,
      'comment',
    );

    if (result === null) {
      throw new HttpException(
        {
          message: DELETE_COMMENT_RESPONSE.DELETE_ERROR,
          code: code.INVALID_PARAMS,
        },
        HttpStatus.BAD_GATEWAY,
      );
    }

    return {
      row: result,
      message: DELETE_COMMENT_RESPONSE.DELETE_SUCCESS,
    };
  }

  /**
   * 删除评论（软删除）
   * @param commentId 评论id
   * @returns
   */
  @Delete('/comment/reply/:replyId')
  @Role(roles.ADMIN)
  async deleteReply(@Param('replyId', ParseIntPipe) replyId) {
    const result = await this.commentService.deleteComment(replyId, 'reply');

    if (result === null) {
      throw new HttpException(
        {
          message: DELETE_COMMENT_RESPONSE.DELETE_ERROR,
          code: code.INVALID_PARAMS,
        },
        HttpStatus.BAD_GATEWAY,
      );
    }

    return {
      row: result,
      message: DELETE_COMMENT_RESPONSE.DELETE_SUCCESS,
    };
  }
}
