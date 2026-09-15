# Unreal Engine snippets for VS Code

A set of VS Code snippets for Unreal Engine C++ and UnrealBuildTool C# files.

**Targets Unreal Engine 5.8.** The C# build-file snippets emit `BuildSettingsVersion.Latest`
and `EngineIncludeOrderVersion.Latest`, so they track whichever engine you build against. If you
prefer to pin (which is what Epic's own templates do, to avoid build behaviour shifting under you
on an engine upgrade), the concrete 5.8 values are `BuildSettingsVersion.V7` and
`EngineIncludeOrderVersion.Unreal5_8`.

## How to use

**Windows**

- Download or clone this repository onto your machine.
- Copy the contents of this repository (except the `.git`, `.github` and `tools` folders).
- Go to `%APPDATA%/Code/User/snippets`.
- Paste the contents of the repository within this folder.
- Restart VS Code (if it was open).
- Happy Coding.

## Snippets

### Classes (`cpp`)

| Prefix | Emits |
| --- | --- |
| `uca` | `AActor`-derived class header |
| `ucc` | `UActorComponent`-derived class header (`BlueprintSpawnableComponent`) |
| `uco` | `UObject`-derived class header |
| `ucs` | `UBlueprintFunctionLibrary`-derived class header |
| `uci` | `UINTERFACE(MinimalAPI, Blueprintable)` + `U`/`I` class pair |
| `ucsub` | Subsystem class (GameInstance / World / Engine / LocalPlayer) |

### Types & members (`cpp`)

| Prefix | Emits |
| --- | --- |
| `ust` | `USTRUCT(BlueprintType)` |
| `uen` | `UENUM(BlueprintType)` `enum class : uint8` |
| `udel` | `DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam` + `BlueprintAssignable` member |
| `uff` | `UFUNCTION(BlueprintCallable)` declaration |
| `ufs` | Static `UFUNCTION` with `WorldContext` meta |
| `ufc` | Constructor declaration |
| `ufci` | Constructor declaration taking `FObjectInitializer` |
| `upe` | `UPROPERTY(EditAnywhere, BlueprintReadWrite)` |
| `upv` | `UPROPERTY(VisibleAnywhere, BlueprintReadOnly)` |
| `upc` | Component `UPROPERTY` using `TObjectPtr<>` |
| `ume` | `MODULENAME_API` export macro |

### Enhanced Input (`cpp`)

| Prefix | Emits |
| --- | --- |
| `ueim` | `UInputMappingContext` / `UInputAction` `TObjectPtr` members |
| `ueic` | `AddMappingContext` in the player controller's `BeginPlay` |
| `ueib` | `BindAction` in `SetupPlayerInputComponent` |

### Modules & logging (`cpp`)

| Prefix | Emits |
| --- | --- |
| `umh` | `IModuleInterface` subclass header |
| `umc` | Module `.cpp` with `IMPLEMENT_GAME_MODULE` |
| `umcp` | Module `.cpp` with `IMPLEMENT_PRIMARY_GAME_MODULE` |
| `ulh` | `DECLARE_LOG_CATEGORY_EXTERN` header (exported) |
| `ulc` | `DEFINE_LOG_CATEGORY` |
| `ull` | `UE_LOG` line |
| `ulf` | `UE_LOG` with `Fatal` verbosity |

### Build files (`csharp`) and descriptors (`json`)

| Prefix | Emits |
| --- | --- |
| `umb` | `ModuleRules` (`.Build.cs`) |
| `umbp` | `ModuleRules` for a plugin module |
| `umt` | `TargetRules` (`.Target.cs`), Game / Client / Server |
| `umte` | `TargetRules` for an Editor target |
| `uuproj` | `.uproject` descriptor |
| `uuplug` | `.uplugin` descriptor |

## Module name detection

Snippets that need the module name (the `_API` macro, `UPROPERTY` categories, log categories)
derive it from the file path. Both common layouts are supported:

```
Source/<Module>/Public/Foo.h     ->  <Module>
Source/<Module>/Private/Foo.h    ->  <Module>
Source/<Module>/Foo.h            ->  <Module>
```

## Development

`.code-snippets` files are parsed by VS Code with a lenient JSONC parser, so a file with a syntax
error loads as *zero snippets* with no visible error. To catch that:

```
node tools/validate-snippets.mjs
```

It parses every snippet file with strict `JSON.parse`, checks each snippet has `scope`, `prefix`,
`body` and `description`, and flags duplicate prefixes within a scope. It runs in CI on every push
and pull request.

Dyronix Out.
