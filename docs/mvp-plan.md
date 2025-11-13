# 自由运动（FreeMotion）MVP 后端规划

## 任务 1：Prisma 数据模型
```prisma
enum UserRole {
  /// 前台用户
  USER
  /// 已通过审核的教练
  COACH
  /// 管理员
  ADMIN
}

enum OrderStatus {
  /// 待支付
  PENDING
  /// 已支付待完成
  PAID
  /// 已完成
  COMPLETED
}

model User {
  /// 主键 ID
  id        Int       @id @default(autoincrement())
  /// 手机号，唯一登录凭证
  phone     String    @unique
  /// 昵称
  nickname  String?
  /// 角色
  role      UserRole  @default(USER)
  /// 创建时间
  createdAt DateTime  @default(now())
  /// 更新时间
  updatedAt DateTime  @updatedAt

  /// 对应的教练资料
  coachProfile CoachProfile?
  /// 用户创建的订单（作为学员）
  orders       Order[]
}

model CoachProfile {
  /// 主键 ID
  id          Int       @id @default(autoincrement())
  /// 对应的用户 ID
  userId      Int       @unique
  /// 所在城市
  city        String
  /// 技能标签，逗号分隔
  skills      String
  /// 单次课程价格
  price       Decimal   @db.Decimal(10, 2)
  /// 教练评分
  rating      Float     @default(5.0)
  /// 审核是否通过
  isApproved  Boolean   @default(false)
  /// 是否对用户可见
  isActive    Boolean   @default(false)
  /// 创建时间
  createdAt   DateTime  @default(now())
  /// 更新时间
  updatedAt   DateTime  @updatedAt

  /// 关联用户
  user   User   @relation(fields: [userId], references: [id])
  /// 相关订单（作为教练）
  orders Order[]

  @@index([city])
  @@index([isApproved, isActive])
}

model Order {
  /// 主键 ID
  id             Int         @id @default(autoincrement())
  /// 下单用户 ID
  userId         Int
  /// 教练资料 ID
  coachId        Int
  /// 订单价格
  price          Decimal      @db.Decimal(10, 2)
  /// 订单状态
  status         OrderStatus  @default(PENDING)
  /// 预约时间
  scheduledAt    DateTime
  /// 自动完成时间
  autoCompleteAt DateTime?
  /// 创建时间
  createdAt      DateTime     @default(now())
  /// 更新时间
  updatedAt      DateTime     @updatedAt

  /// 下单用户
  user   User          @relation(fields: [userId], references: [id])
  /// 预约的教练
  coach  CoachProfile  @relation(fields: [coachId], references: [id])

  @@index([userId])
  @@index([coachId])
  @@index([status])
  @@index([autoCompleteAt])
}
```

## 任务 2：NestJS 模块拆分与职责
| 模块 | 主要文件 | 职责边界 |
| --- | --- | --- |
| `src/auth` | `auth.module.ts`、`auth.controller.ts`、`auth.service.ts` | 负责注册/登录、JWT 签发与校验、守卫及策略。`service` 处理用户认证逻辑，`controller` 提供 `/auth/*` 接口，`module` 聚合 Passport、JwtModule 与 UserModule。 |
| `src/user` | `user.module.ts`、`user.controller.ts`、`user.service.ts` | 用户基本信息查询、更新个人资料、获取我的订单等。`service` 与 Prisma 交互，`controller` 提供 `/users/*` API。 |
| `src/coach` | `coach.module.ts`、`coach.controller.ts`、`coach.service.ts` | 教练入驻申请、资料管理、教练列表与详情、教练侧订单查看。`service` 处理教练业务规则，`controller` 暴露 `/coaches/*`。 |
| `src/order` | `order.module.ts`、`order.controller.ts`、`order.service.ts` | 预约下单、支付模拟、订单状态流转、自动完成触发接口。`service` 负责订单验证与状态变更，`controller` 提供 `/orders/*`。 |
| `src/admin` | `admin.module.ts`、`admin.controller.ts`、`admin.service.ts` | 管理员登录、教练审核列表与审批操作。`service` 检查权限并操作教练状态，`controller` 提供 `/admin/*`。 |
| `src/payment` | `payment.module.ts`、`payment.controller.ts`、`payment.service.ts` | 模拟支付接口、回调处理，供订单模块调用。可直接返回支付状态。 |
| `src/scheduler` | `scheduler.module.ts`、`scheduler.service.ts` | 使用 `@nestjs/schedule` 定时扫描超时未确认的订单并自动完成，`module` 导入 `ScheduleModule`. |
| `src/common` | `common.module.ts`、`common.service.ts`（可选） | 放置全局拦截器、过滤器、DTO、装饰器与共用工具，供其他模块复用。 |

## 任务 3：API 接口清单

| 接口路径 | 方法 | 功能说明 | 请求参数 | 返回示例 | 登录 | 角色 |
| --- | --- | --- | --- | --- | --- | --- |
| `/auth/register` | POST | 用户/教练注册 | Body：`{ phone, password, nickname, role }` | `{ "token": "jwt", "user": {"id":1,"role":"USER"} }` | 否 | all |
| `/auth/login` | POST | 登录换取 JWT | Body：`{ phone, password }` | `{ "token": "jwt", "user": {...} }` | 否 | all |
| `/users/me` | GET | 获取当前用户信息 | Header：`Authorization` | `{ "id":1,"phone":"...","role":"USER" }` | 是 | USER/COACH/ADMIN |
| `/users/me` | PATCH | 更新昵称等资料 | Body：`{ nickname }` | `{ "id":1,"nickname":"新昵称" }` | 是 | USER/COACH |
| `/coaches` | GET | 搜索教练列表 | Query：`city?`, `skills?`, `minPrice?`, `maxPrice?` | `[ {"id":1,"city":"上海","price":199} ]` | 否 | USER |
| `/coaches/:id` | GET | 获取教练详情 | Path：`id` | `{ "id":1,"skills":"增肌,HIIT",... }` | 否 | USER |
| `/coach/apply` | POST | 教练入驻申请 | Body：`{ city, skills, price, intro }` | `{ "id":3,"isApproved":false }` | 是 | USER（申请中） |
| `/coach/profile` | GET | 查询我的教练资料 | Header JWT | `{ "id":3,"isApproved":true,... }` | 是 | COACH |
| `/coach/profile` | PATCH | 编辑教练资料 | Body：`{ city?, skills?, price?, intro?, isActive? }` | `{ "id":3,"isActive":true }` | 是 | COACH |
| `/coach/orders` | GET | 教练订单列表 | Query：`status?` | `[ {"id":10,"status":"PAID"} ]` | 是 | COACH |
| `/orders` | POST | 创建预约订单 | Body：`{ coachId, scheduledAt }` | `{ "id":20,"status":"PENDING" }` | 是 | USER |
| `/orders/:id` | GET | 查看订单详情 | Path：`id` | `{ "id":20,"status":"PAID" }` | 是 | USER/COACH |
| `/orders/:id/pay` | POST | 模拟支付 | Path：`id`; Body：`{ paymentMethod }` | `{ "id":20,"status":"PAID" }` | 是 | USER |
| `/orders/:id/complete` | POST | 手动确认完成 | Path：`id` | `{ "id":20,"status":"COMPLETED" }` | 是 | USER/COACH |
| `/orders` | GET | 用户订单列表 | Query：`status?` | `[ {"id":20,"status":"PENDING"} ]` | 是 | USER |
| `/admin/login` | POST | 管理员登录 | Body：`{ phone, password }` | `{ "token":"jwt","user":{"role":"ADMIN"} }` | 否 | ADMIN |
| `/admin/coaches` | GET | 待审核教练列表 | Query：`status?` | `[ {"id":3,"isApproved":false} ]` | 是 | ADMIN |
| `/admin/coaches/:id/approve` | POST | 审核通过 | Path：`id`; Body：`{ approved: true }` | `{ "id":3,"isApproved":true }` | 是 | ADMIN |
| `/admin/coaches/:id/reject` | POST | 审核拒绝 | Path：`id`; Body：`{ reason }` | `{ "id":3,"isApproved":false,"note":"原因" }` | 是 | ADMIN |
| `/payments/mock` | POST | 模拟支付回调 | Body：`{ orderId, status }` | `{ "orderId":20,"status":"PAID" }` | 否 | system |

> 注：返回字段示例仅展示核心字段，实际实现可通过 DTO 细化。

## 任务 4：Mac 项目初始化步骤
1. **创建项目与进入目录**
   ```bash
   mkdir freemotion-backend && cd freemotion-backend
   ```
2. **初始化 NestJS 项目**
   ```bash
   npm init -y
   npm install -g @nestjs/cli
   nest new api --package-manager npm
   cd api
   ```
3. **安装依赖**
   ```bash
   npm install @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt @nestjs/schedule
   npm install class-validator class-transformer
   npm install @prisma/client
   npm install -D prisma
   ```
4. **初始化 Prisma 与数据库（SQLite）**
   ```bash
   npx prisma init --datasource-provider sqlite
   ```
5. **编辑 `prisma/schema.prisma`**：粘贴上文数据模型并保存。
6. **执行数据库迁移 & 生成 Prisma Client**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```
7. **创建基础模块**
   ```bash
   nest g module auth && nest g controller auth --no-spec && nest g service auth --no-spec
   nest g module user && nest g controller user --no-spec && nest g service user --no-spec
   nest g module coach && nest g controller coach --no-spec && nest g service coach --no-spec
   nest g module order && nest g controller order --no-spec && nest g service order --no-spec
   nest g module admin && nest g controller admin --no-spec && nest g service admin --no-spec
   nest g module payment && nest g controller payment --no-spec && nest g service payment --no-spec
   nest g module scheduler && nest g service scheduler --no-spec
   ```
8. **启动开发服务器**
   ```bash
   npm run start:dev
   ```
