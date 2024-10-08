import { TagsService } from './../tags/tags.service';
import { UserService } from './../user/user.service';
import { Injectable, Logger } from '@nestjs/common';
import { GetArticleDTO } from './dto/getArticles.dto';
import { handlePage } from 'src/utils/common';
import { DataSource, Repository } from 'typeorm';
import { Article } from './entity/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateArticleDTO } from './dto/createArticle.dto';
import * as dayjs from 'dayjs';
import { User } from '../user/entity/user.entity';
import { Tags } from '../tags/entity/tags.entity';
import { ADD_ARTICLE_ERROR } from './constant';
import { ArticleType } from './entity/articleType.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    private dataSource: DataSource,
    private readonly userService: UserService,
    private readonly tagsService: TagsService,
  ) {}

  getTotal() {
    return this.articleRepository.count();
  }

  /**
   * 分页查询
   * @param getArticleDto
   * @returns
   */
  async find(getArticleDto: GetArticleDTO) {
    const { field, keyword, sorted = 'DESC' } = getArticleDto;
    const { skip, offset } = handlePage(getArticleDto);
    const queryBuild = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.type', 'type')
      .skip(skip)
      .take(offset as number)
      .orderBy('article.id', sorted)
    if (field === 'type' && keyword) {
      const keywordArray = keyword.split(',');
      for (const item of keywordArray) {
        queryBuild.andWhere(`article.${field} = :type`, { type: item });
      }
    } else if (field && keyword) {
      queryBuild.andWhere(`article.${field} like :keyword`, {
        keyword: `%${keyword}%`,
      });
    }

    return queryBuild.getManyAndCount();
  }

  /**
   * 根据文章ID查询文章
   * @param article_id
   * @returns
   */
  async findById(article_id: number) {
    const article = await this.articleRepository.findOneBy({ id: article_id });
    if (!article) {
      return null;
    }
    // 文章浏览量 + 1
    await this.articleRepository
      .createQueryBuilder()
      .update()
      .set({ watch_num: article.watch_num + 1 })
      .where('id = :id', { id: article_id })
      .execute();
    return this.articleRepository
      .createQueryBuilder('article')
      .leftJoin('article.author', 'author')
      .addSelect(['author.id', 'author.account'])
      .leftJoinAndSelect('author.profile', 'profile')
      .leftJoinAndSelect('article.type', 'type')
      .where('article.id = :id', { id: article_id })
      .getOne();
  }

  /**
   * 根据标签ID查询文章
   * @param tag_id
   * @param order
   * 可选 DESC 或者 ASC, 默认为 DESC
   * @param skip
   * @param offset
   * @returns
   */
  findArticleByTagId(
    tag_id: number,
    order: 'DESC' | 'ASC' = 'DESC',
    skip: number,
    offset: number,
  ) {
    return this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.tagsEntity', 'tags')
      .leftJoinAndSelect('article.type', 'type')
      .where('tags.id = :tag_id', { tag_id })
      .orderBy('article.id', order)
      .skip(skip)
      .take(offset as number)
      .getManyAndCount();
  }

  /**
   * 根据用户ID查询文章
   * @param tag_id
   * @param order
   * 可选 DESC 或者 ASC, 默认为 DESC
   * @param skip
   * @param offset
   * @returns
   */
  findArticleByUserId(
    user_id: number,
    order: 'DESC' | 'ASC' = 'DESC',
    skip: number,
    offset: number,
  ) {
    return this.articleRepository
      .createQueryBuilder('article')
      .leftJoin('article.author', 'author')
      .addSelect(['author.id', 'author.account'])
      .leftJoinAndSelect('author.profile', 'profile')
      .leftJoinAndSelect('article.type', 'type')
      .where('author.id = :user_id', { user_id })
      .orderBy('article.id', order)
      .skip(skip)
      .take(offset as number)
      .getManyAndCount();
  }

  /**
   * 新增文章
   * @param createArticleDto
   * @returns
   */
  async createArticle(createArticleDto: CreateArticleDTO, tagsList: Tags[], articleType: ArticleType) {
    const { author_id, tags } = createArticleDto;
    const article = new Article();
    const user = new User();
    user.id = author_id as number;
    article.publish_date = dayjs().format('YYYY-MM-DD HH:mm:ss');
    article.author = user;
    article.tagsEntity = tagsList;
    article.type = articleType;
    const mergeArticle = Object.assign(article, createArticleDto) as Article;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED');

    try {
      const saveArticle = queryRunner.manager.save(mergeArticle);
      if (!saveArticle) {
        throw ADD_ARTICLE_ERROR.ARTICE_SAVE_ERROR;
      }
      // 标签数 + 1
      const updateTagsResult = await this.tagsService.incrementTagsByNum(tags, queryRunner);
      if (updateTagsResult.affected < 1) {
        throw ADD_ARTICLE_ERROR.TAG_SAVE_ERROR;
      }
      // 用户数 + 1
      const updateArticleResult =
        await this.userService.incrementArticleNum(author_id, queryRunner);
      if (updateArticleResult.affected < 1) {
        throw ADD_ARTICLE_ERROR.USER_ARTICLE_NUM_ERROR;
      }

      await queryRunner.commitTransaction();
      return saveArticle;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      Logger.error(e);
      return null;
    } finally {
      queryRunner.release();
    }
  }

  /**
   * 根据年份和日期查询
   * @param year
   * @param month
   * @returns
   */
  async findByYearAndMonth(year: number, month: number) {
    return this.articleRepository
      .createQueryBuilder()
      .where('YEAR(publish_date) = :year and MONTH(publish_date) = :month', {
        year: year,
        month,
      })
      .orderBy('id', 'DESC')
      .getManyAndCount();
  }

  /**
   * 获取时间轴
   * @param pageDto
   */
  async findTimeLine(order: 'DESC' | 'ASC') {
    const data = await this.articleRepository
      .createQueryBuilder('article')
      .select('YEAR(publish_date)', 'year')
      .addSelect('MONTH(publish_date)', 'month')
      .groupBy('year, month')
      .orderBy('month', order)
      .getRawMany();

    for (const item of data) {
      const [child, count] = await this.findByYearAndMonth(
        item.year,
        item.month,
      );
      item.child = {
        rows: child,
        count,
      };
    }

    const gruop = await this.articleRepository
      .createQueryBuilder()
      .select(
        'COUNT(DISTINCT CONCAT(YEAR(publish_date), MONTH(publish_date)))',
        'count',
      )
      .getRawOne();
    return [data, gruop.count];
  }

  /**
   * 删除文章（软删除）
   * @param article_id
   * @returns
   */
  async deleteArticle(article_id: number) {
    const result = await this.articleRepository
      .createQueryBuilder()
      .useTransaction(true)
      .softDelete()
      .where('id = :id', { id: article_id })
      .execute();
    return result;
  }
}
