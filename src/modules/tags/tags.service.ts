import { Injectable } from '@nestjs/common';
import { In, QueryRunner, Repository } from 'typeorm';
import { Tags } from './entity/tags.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { handlePage } from 'src/utils/common';
import { GetTagsDto } from './dto/getTags.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tags)
    private readonly tagsRepository: Repository<Tags>,
  ) {}

  getTotal() {
    return this.tagsRepository.count();
  }

  /**
   * 创建标签
   * @param tags
   * @returns
   */
  create(tags: Tags): Promise<Tags> {
    return this.tagsRepository.save(tags);
  }

  /**
   * 查询标签
   * @returns
   */
  async findAll(getTagsDto: GetTagsDto): Promise<[Tags[], number]> {
    const { field, keyword, sorted = 'DESC' } = getTagsDto;
    const { skip, offset } = handlePage(getTagsDto);
    const queryBuild = this.tagsRepository
      .createQueryBuilder()
      .skip(skip)
      .take(offset as number)
      .orderBy('id', sorted);
    if (field && keyword) {
      queryBuild.andWhere(`tags.${field} like :keyword`, {
        keyword: `%${keyword}%`,
      });
    }

    return queryBuild.getManyAndCount();
  }

  /**
   * 根据标签名称或者id查询标签信息
   * @param params
   * 必须传一个，当传入两个，默认当id查询
   * @returns
   */
  findOneByIdOrName(params: { id?: number; name?: string }): Promise<Tags> {
    const { id, name } = params;
    if (id) {
      return this.tagsRepository.findOne({ where: { id: id } });
    }
    return this.tagsRepository.findOne({ where: { tagName: name } });
  }

  /**
   * 更新标签名称
   * @param id
   * @param tagName
   * @returns
   */
  updateTag(id: number, tagName: string) {
    return this.tagsRepository.update(id, { tagName });
  }

  /**
   * 删除标签
   * @param id
   * @returns
   */
  deleteTag(id: number) {
    return this.tagsRepository.softDelete(id);
  }

  /**
   * 根据标签名称数组查询标签
   * @param tags
   * @returns
   */
  findByTagNameArray(tags: string[]) {
    return this.tagsRepository.find({ where: { tagName: In(tags) } });
  }

  /**
   * 增加标签文章数
   * @param tags
   * @returns
   */
  incrementTagsByNum(tags: string[], queryRunner?: QueryRunner) {
    let queryBuilder: any = this.tagsRepository
    if (queryRunner) {
      queryBuilder = queryRunner.manager
    }
    queryBuilder =  queryBuilder.createQueryBuilder()
    .update(Tags)
    .set({ byNum: () => 'byNum + 1' })
    for (let i = 0; i < tags.length; i++) {
      queryBuilder = queryBuilder.orWhere('tags.tag_name = :tag'+i, {
        ['tag'+i]: tags[i],
      });
    }

    return queryBuilder.execute();
  }
}
