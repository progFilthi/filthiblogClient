enum Roles {
  ADMIN,
  USER,
}

export interface PostAuthorTypes {
  // Long id,
  // String username,
  // String email
  id: string | number;
  username: string;
  email: string;
  role?: Roles;
}

export interface PostResponseTypes {
  // Long id,
  // String title,
  // String content,
  // PostAuthorDto author,
  // LocalDateTime createdAt,
  // LocalDateTime updatedAt

  id: string | number;
  title: string;
  content: string;
  author: PostAuthorTypes;
  createdAt: string; //matches best for ISO string for the LocalDateTime in springboot
  updatedAt: string;
}
