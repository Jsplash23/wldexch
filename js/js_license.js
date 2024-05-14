function countryDetect() {
    APICall('country.detect').then(function (d) {
        var config = d.countryInfo.config;
        if (('' + window.location.href).indexOf('cnip') > 0) {
            config = null;
        }
        if (!config) {
            setCookieLicense('CXUS');
        } else {
            Object.keys(config).some(function (v) {
                if (config[v].primary == true && !config[v].paused) {
                    document.cookie = "__cp_ipLicense= " + v + "; expires=Thu, 01 Jan 2025 00:00:01 UTC; path=/;";
                    primaryUJurisdiction = v;
                    if (!cookieGet('__cp_license')) {
                        setCookieLicense(v);
                    }
                    return true;
                }
            });
        }
        toggleLicenseSwitcher();
        fillLData();
    });
}

function setCookieLicense(license) {
    document.cookie = "__cp_license= " + license + "; expires=Thu, 01 Jan 2025 00:00:01 UTC; path=/;";
    uJurisdiction = license;
    toggleAppVersion();
}

countryDetect();

$('.license__link').on('click', function (e) {
    e.preventDefault();
    var linkLicense = $(this).data('l');
    if (uJurisdiction != linkLicense) {
        setCookieLicense(linkLicense);
    }
    redirectToProduct();
});

function toggleLicenseSwitcher() {
    var data = $('.license__link[data-l=' + uJurisdiction + '] span').text();
    if (uJurisdiction == 'CXUS_ZH') {
        data = $('.license__link[data-l="CXUS"] span').text();
    }
    if (uJurisdiction) {
        $('.license__btn .currentLicense').text(data);
    }

    if (primaryUJurisdiction != uJurisdiction && !cookieGet('__cp_lc_notice')) {
        showRw();
    }
}

function redirectToProduct() {
    if (!cwLicenses.includes(uJurisdiction)) {
        document.location.href = domainURL;
    } else {
        document.location.href = cwURL;
    }
}

function fillLData() {
    if (logged) {
        $('.js-license').addClass('disabled');
        $('.js-license').off('click');
    }

    $('[data-license]').addClass('hidden');
    $('.only_htp, .only_cxstv, .only_dlt_pro').addClass('hidden'); // for menu (header/footer)

    if (uJurisdiction) {
        $('[data-license="' + uJurisdiction + '"]').removeClass('hidden');
        if (uJurisdiction == "CXUS_ZH") {
            $('[data-license="CXUS"]').removeClass('hidden');
        }

        $('.only_' + uJurisdiction.toLowerCase()).removeClass('hidden'); // for menu (header/footer)
        if (cwLicenses.includes(uJurisdiction)) {
            signupObj('s_inline');
            $('.only_cx').addClass('hidden'); // for menu (header/footer)
            $('[data-license="CXSTV"]').removeClass('hidden'); // default for cx
        } else {
            $('.only_cw').addClass('hidden'); // for menu (header/footer)
            $('[data-license="DLT"]').removeClass('hidden'); // default for cw
        }
    } else {
        $('[data-license="CXSTV"]').removeClass('hidden');
    }

    if (primaryUJurisdiction == 'HTP' || uJurisdiction == 'HTP') {
        $('.license__link[data-l="HTP"]').removeClass('hidden');
    }
}

$('.js-notification .js-close').on('click', function (e) {
    e.preventDefault();
    $('.js-notification').addClass('hidden');
    var day = new Date();
    day.setTime(day.getTime() + 86400000); //24h
    document.cookie = "__cp_lc_notice=1; expires=" + (day.toGMTString() || "Thu, 01 Jan 2030 00:00:01 UTC") + "; path=/;";
});

function getUserLicense() {
    var res = null;
    APICall('user.jurisdictions.get', {}, getSID()).then(function (d) {
        jurisdictionData = d;
        if (jurisdictionData.jurisdictions) {
            jurisdictionData.jurisdictions.forEach(function (v) {
                res = v.license;
            });
            if (res && res != uJurisdiction) {
                document.cookie = "__cp_license= " + res + "; expires=Thu, 01 Jan 2025 00:00:01 UTC; path=/;";
            }
        }
    }).catch(function (e) { });
}

function showRw() {
    if (!primaryUJurisdiction) { return; }
    if (primaryUJurisdiction == 'CXUS' && uJurisdiction == 'CXUS_ZH') {
        return;
    }
    var rw = $('.js-notification .cx-notification__frame');
    var link = $('a', rw);
    if (cwLicenses.includes(primaryUJurisdiction)) {
        $(link).attr('href', cwURL);
    } else {
        $(link).attr('href', domainURL);
    }
    var rwTxt = $(rw).html();
    if (!rwTxt) { return; }
    rwTxt = rwTxt.replaceAll("##CURRENT_COUNTRY##", country.toUpperCase());
    rwTxt = rwTxt.replace("##CURRENT_LICENSE##", $('.license__btn .currentLicense').text());
    rwTxt = rwTxt.replace("##BY_COUNTRY_LICENSE##", $('.license__link[data-l="' + primaryUJurisdiction + '"] span').text());
    $(rw).html(rwTxt);
    $('.js-notification').removeClass('hidden');
}

$(document).on('click', '.cx-notification__frame a', function (e) {
    e.preventDefault();
    setCookieLicense(primaryUJurisdiction);
    document.location.href = $(this).attr('href');
});

$(document).on('click', '.cx-overlay__close', function (e) {
    setCookieLicense('CXSTV');
    $('.cx-notification__frame').html(_l.gt778);
    toggleLicenseSwitcher();
    $('#cw_overlay', document).addClass('hidden');
});

