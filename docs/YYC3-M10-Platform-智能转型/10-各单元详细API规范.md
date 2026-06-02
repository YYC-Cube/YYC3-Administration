# 第十章：各单元详细API规范

### 10.1 API全局规范

#### 统一响应格式

```typescript
// 全局响应DTO
interface ApiResponse<T> {
  code: number;        // 状态码
  message: string;     // 消息
  data: T;            // 数据
  timestamp: number;   // 时间戳
  requestId: string;   // 请求ID
}

// 分页响应DTO
interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

```text

#### RESTful API设计规范

```yaml
命名规范:
  ✅ 资源名词复数: /api/v1/menus
  ✅ 动作动词: POST /api/v1/menus/{id}/publish
  ✅ 版本控制: /api/v1/ 路径版本
  ✅ 查询参数: ?page=1&size=20&sort=createTime,desc

HTTP方法:
  🔹 GET: 查询
  🔹 POST: 新增
  🔹 PUT: 全量更新
  🔹 PATCH: 部分更新
  🔹 DELETE: 删除

```text

### 10.2 核心业务API规范

#### 智能菜单服务API

```java
@RestController
@RequestMapping("/api/v1/menus")
public class MenuController {
    
    /**
     * 获取动态菜单
     */
    @GetMapping("/dynamic")
    public ApiResponse<DynamicMenuDTO> getDynamicMenu(
        @RequestParam String restaurantId,
        @RequestParam(required = false) String userId,
        @RequestParam(required = false) String context) {
        // 实现逻辑
    }
    
    /**
     * 智能推荐菜品
     */
    @PostMapping("/{menuId}/recommendations")
    public ApiResponse<List<DishRecommendationDTO>> getRecommendations(
        @PathVariable String menuId,
        @RequestBody RecommendationRequest request) {
        // 实现逻辑
    }
    
    /**
     * 动态定价查询
     */
    @GetMapping("/{menuId}/dishes/{dishId}/price")
    public ApiResponse<DynamicPriceDTO> getDynamicPrice(
        @PathVariable String menuId,
        @PathVariable String dishId,
        @RequestParam String context) {
        // 实现逻辑
    }
}

```text

#### 智能表单服务API

```java
@RestController
@RequestMapping("/api/v1/forms")
public class FormController {
    
    /**
     * 获取智能表单模板
     */
    @GetMapping("/templates/{templateId}")
    public ApiResponse<FormTemplateDTO> getFormTemplate(
        @PathVariable String templateId,
        @RequestParam(required = false) String version) {
        // 实现逻辑
    }
    
    /**
     * 提交表单数据（支持离线）
     */
    @PostMapping("/submissions")
    public ApiResponse<FormSubmissionResultDTO> submitForm(
        @RequestBody FormSubmissionRequest request) {
        // 实现逻辑
    }
    
    /**
     * 表单数据智能分析
     */
    @PostMapping("/analytics")
    public ApiResponse<FormAnalyticsDTO> analyzeFormData(
        @RequestBody FormAnalyticsRequest request) {
        // 实现逻辑
    }
}

```text

#### 知识图谱服务API

```java
@RestController
@RequestMapping("/api/v1/knowledge-graph")
public class KnowledgeGraphController {
    
    /**
     * 查询菜品关联关系
     */
    @GetMapping("/dishes/{dishId}/relations")
    public ApiResponse<List<GraphRelationDTO>> getDishRelations(
        @PathVariable String dishId,
        @RequestParam(required = false) Integer depth) {
        // 实现逻辑
    }
    
    /**
     * 智能菜品搭配推荐
     */
    @PostMapping("/dishes/{dishId}/pairings")
    public ApiResponse<List<DishPairingDTO>> getDishPairings(
        @PathVariable String dishId,
        @RequestBody PairingContext context) {
        // 实现逻辑
    }
}

```text

---
