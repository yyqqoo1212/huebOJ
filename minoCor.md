## Minio操作手册

### minio.exe Server
```
启动服务
minio.exe server D:\minio_data
minio.exe server D:\minio_data --console-address ":9001"
```

### mc.exe Client
```
启动服务
mc.exe alias set local http://127.0.0.1:9000 minioadmin minioadmin

设置bucket公开
mc.exe anonymous set download local/bucket
```