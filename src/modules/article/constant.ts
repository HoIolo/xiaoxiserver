// 创建文章规则
export const createArticleRules = {
  title: {
    // 最小长度为 5
    MIN_LENGTH: 5,
    // 最大长度为 20
    MAX_LENGTH: 20,
  },
  description: {
    MAX_LENGTH: 200,
  },
};

// 新增文章响应提示
export const CREATE_ARTICLE_RESPONSE = {
  SUCCESS: '新增成功！',
  FAIL: '新增失败，系统繁忙，请稍后再试！',
  PARAMS_ERROR: '参数错误，请重新提交！',
  TAGS_ERROR: '参数错误，不存在某个或者全部标签！',
  TYPEID_ERROR: '参数错误，不存在这个分类！',
};

// 根据标签id查询文章响应
export const FIND_ARTICLE_BY_TAG_ID_RESPONSE = {
  SUCCESS: '查询成功！',
  FAIL: '查询失败，系统繁忙，请稍后再试！',
  TAGID_ERROR: '参数错误，不存在这个标签！',
};

// 根据用户id查询文章响应
export const FIND_ARTICLE_BY_USER_ID_RESPONSE = {
  SUCCESS: '查询成功！',
  FAIL: '查询失败，系统繁忙，请稍后再试！',
  USER_ERROR: '该用户未发布过文章！',
};

// 查询文章响应提示
export const FIND_ARTICLE_RESPONSE = {
  PARAMS_ERROR: '参数错误，不存在这篇文章！',
};

export const DEFAULT_RESOPNSE = {
  PARAMS_ERROR: '参数错误，请重新提交！',
};

// 删除文章响应提示
export const DELETE_ARTICLE_RESPONSE = {
  SUCCESS: '删除成功！',
  FAIL: '删除失败，系统繁忙，请稍后再试！',
  PARAMS_ERROR: '参数错误，不存在这篇文章！',
};

// 新增文章错误提示
export const ADD_ARTICLE_ERROR = {
  ARTICE_SAVE_ERROR: '文章新增失败！',
  TAG_SAVE_ERROR: '标签引用数量新增失败！',
  USER_ARTICLE_NUM_ERROR: '用户文章数量新增失败！',
};

// 新增文章类型错误提示
export const ADD_ARTICLE_TYPE_ERROR = {
  ARTICLE_TYPE_ALREADY_EXIST: '文章类型已存在！',
};
