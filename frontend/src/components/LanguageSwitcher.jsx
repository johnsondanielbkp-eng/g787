import { Check, ChevronDown } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useLocale } from "../i18n/LocaleProvider";
import "../styles/language-switcher.css";

const languages = [
  { code: "pt-BR", short: "PT", name: "Português (Brasil)", flag: "/flags/br.svg" },
  { code: "es", short: "ES", name: "Español", flag: "/flags/es.svg" },
];

export const LanguageSwitcher = () => {
  const { locale, changeLocale } = useLocale();
  const current = languages.find((language) => language.code === locale);
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button type="button" className="language-trigger" data-testid="language-switcher-trigger"
          aria-label={locale === "es" ? "Cambiar idioma" : "Trocar idioma"}>
          <img src={current.flag} alt="" aria-hidden="true" width="24" height="16" />
          <span data-testid="language-current">{current.short}</span>
          <ChevronDown size={13} aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={10} collisionPadding={12}
          className="language-menu" data-testid="language-menu" aria-label="Idioma">
          <DropdownMenu.RadioGroup value={locale} onValueChange={changeLocale}>
            {languages.map((language) => (
              <DropdownMenu.RadioItem key={language.code} value={language.code}
                className="language-option" lang={language.code}
                data-testid={`language-option-${language.code}`}>
                <img src={language.flag} alt="" aria-hidden="true" width="24" height="16" />
                <span>{language.name}</span>
                <DropdownMenu.ItemIndicator className="language-check">
                  <Check size={15} aria-hidden="true" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};