include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-mybaby
PKG_VERSION:=1.0
PKG_RELEASE:=1

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/luci-app-mybaby
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  TITLE:=MyBaby - TV Time Limit Control
  DEPENDS:=+luci +nftables
  PKGARCH:=all
endef

define Package/luci-app-mybaby/description
  A MAC-based device time control plugin for OpenWrt/iStoreOS
endef

define Build/Prepare
	$(INSTALL_DIR) $(PKG_BUILD_DIR)/files
	$(CP) $(CURDIR)/files/* $(PKG_BUILD_DIR)/files/
	$(INSTALL_DIR) $(PKG_BUILD_DIR)/luasrc
	$(CP) $(CURDIR)/luasrc/* $(PKG_BUILD_DIR)/luasrc/
	$(INSTALL_DIR) $(PKG_BUILD_DIR)/htdocs
	if [ -d "$(CURDIR)/htdocs" ]; then \
		$(CP) -r $(CURDIR)/htdocs/* $(PKG_BUILD_DIR)/htdocs/; \
	fi
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/luci-app-mybaby/install
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) $(PKG_BUILD_DIR)/files/etc/config/tv_limit $(1)/etc/config/tv_limit
	
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/files/etc/init.d/tv_limit $(1)/etc/init.d/tv_limit
	
	$(INSTALL_DIR) $(1)/etc/tv_limit
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/files/etc/tv_limit/nft.sh $(1)/etc/tv_limit/nft.sh

	$(INSTALL_DIR) $(1)/usr/lib/lua/luci
	$(CP) $(PKG_BUILD_DIR)/luasrc/* $(1)/usr/lib/lua/luci/
	
	$(INSTALL_DIR) $(1)/www
	if [ -d "$(PKG_BUILD_DIR)/htdocs" ]; then \
		$(CP) $(PKG_BUILD_DIR)/htdocs/* $(1)/www/; \
	fi
	
	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(INSTALL_DATA) $(PKG_BUILD_DIR)/files/usr/share/rpcd/acl.d/luci-app-mybaby.json $(1)/usr/share/rpcd/acl.d/luci-app-mybaby.json
endef

$(eval $(call BuildPackage,luci-app-mybaby))
