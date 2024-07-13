# Forward Wordpress posts

Wordpressの記事データを別環境のWordpressに送信します。

本プログラムは、JWT認証のWordpress REST APIを利用しています。また、Basic認証下でも利用できるため、検証環境への記事データの転送にも活用できます。


## How to use

1. JWT認証でWordpress REST APIを利用できるように設定します
2. 設定ファイルを用意します
3. `node forward-wp-posts.js` でプログラムを実行します


## Wordpress REST API について

[JWT Authentication for WP REST API](https://ja.wordpress.org/plugins/jwt-authentication-for-wp-rest-api/) プラグインがインストールされたWordpress環境での動作をサポートしてます。[プラグインページ](https://ja.wordpress.org/plugins/jwt-authentication-for-wp-rest-api/)のガイドに従って、Wordpress REST APIが利用できるように設定を済ませてください。

Basic認証環境下での利用時には、`.httaccess` に以下を追記する必要があります：

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


## 変更履歴

| 日付       | 概要 |
| ---------- | -------- |
| 2024/07/13 | 公開 |


## お問い合わせ

作成者 [udcxx](https://udcxx.me/) へのお問い合わせは、[コンタクトフォーム](https://udcxx.me/contact/)からお願いいたします。

プログラムのバグや改修案については、issueからもコンタクトいただけます。