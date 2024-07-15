# Forward Wordpress posts

Wordpressの記事データを別環境のWordpressに送信します。

本プログラムは、JWT認証のWordpress REST APIを利用しています。また、Basic認証下でも利用できるため、検証環境への記事データの転送にも活用できます。


## How to use

1. JWT認証でWordpress REST APIを利用できるように設定します
2. 設定ファイルを用意します
3. `node forward-wp-posts.js` でプログラムを実行します


## Wordpress REST API について

[JWT Authentication for WP REST API](https://ja.wordpress.org/plugins/jwt-authentication-for-wp-rest-api/) プラグインがインストールされたWordpress環境での動作をサポートしてます。[プラグインページ](https://ja.wordpress.org/plugins/jwt-authentication-for-wp-rest-api/)のガイドに従って、Wordpress REST APIが利用できるように設定を済ませてください。

Basic認証環境下での利用時には、`.htaccess` に以下を追記する必要があります：

```ApacheConf
SetEnvIf X-Authorization "(.*)" HTTP_AUTHORIZATION=$1
```


## 設定ファイルについて

プログラム本体（`forward-wp-posts.js`）と同階層に、設定ファイル（`forward-wp-posts-config.json`）を用意する必要があります。

設定ファイルの記載方法は、`forward-wp-posts-config-template.json` を参考にしてください。

設定ファイルでは、Wordpressへログインするための認証情報や、Basic認証の認証情報を平文で保管しているため、`.gitignore` に以下を必ず追記してください：

```gitignore
forward-wp-posts-config.json
```


## 指定できるオプション

プログラム実行時に、以下の引数を指定することが可能です。

### --pull

通常は、設定ファイルのlocalからremoteへ記事データを送信しますが、`--pull`オプションを指定した場合、remoteからlocalへ記事データを送信します。

### --force-create

通常は、すでに同じスラッグの記事が存在する場合その記事を更新しますが、`--force-create` オプションを指定した場合、記事の存在確認を行わず、すべて新規追加します。


## 制限事項

* 操作できる記事は100件までです
    * Wordpress REST APIで `per_page` オプションの最大値が100のため
    * 直列処理のため、記事数が増えると処理に時間がかかるようになります
* 公開されている記事が対象です
    * 下書きの記事は操作されません


## 変更履歴

| 日付       | 概要 |
| ---------- | -------- |
| 2024/07/13 | 公開 |
| 2024/07/15 | ・`--force-create` オプションの追加<br>・1度に100件まで処理できるように変更 |


## お問い合わせ

作成者 [udcxx](https://udcxx.me/) へのお問い合わせは、[コンタクトフォーム](https://udcxx.me/contact/) からお願いいたします。

プログラムのバグや改修案については、issueからもコンタクトいただけます。